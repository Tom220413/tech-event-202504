'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import styles from './components/layout/styles.module.css';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import IssueList from './components/issues/IssueList';
import IssueDetail from './components/issues/IssueDetail';
import IssueForm from './components/issues/IssueForm';
import { TAGS, PRIORITY } from './lib/constants';

export default function Home() {
  const router = useRouter();
  const { user, loading, isAuthenticated, signOut } = useAuth();
  const [filter, setFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [editedIssue, setEditedIssue] = useState(null);
  const [newIssue, setNewIssue] = useState({
    inputter_name: user?.user_metadata?.display_name || '山田太郎',
    priority: PRIORITY.MEDIUM,
    title: '',
    content: '',
    tag: TAGS.DEVELOPMENT,
    limit: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // 認証ヘッダーを取得するヘルパー関数
  const getAuthHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }, []);

  const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/issues', {
        headers
      });
      
      if (!response.ok) {
        throw new Error('課題の取得に失敗しました');
      }
      const data = await response.json();
      
      // Supabaseからのデータ形式に対応
      const formattedIssues = data.map(issue => ({
        id: issue.id,
        create_date: issue.created_at ? issue.created_at.split('T')[0] : issue.registration_date,
        username: issue.inputter_name,
        urgency: issue.priority,
        title: issue.title,
        content: issue.content,
        tag: issue.tag,
        limit: issue.limit_date || issue.limit,
        flg: issue.is_resolved || issue.isResolve || false
      }));
      setIssues(formattedIssues);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      setSubmitError('課題の取得に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // 認証チェック
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchIssues();
    }
  }, [isAuthenticated, fetchIssues]);

  // ローディング中または未認証の場合は何も表示しない
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // リダイレクト中
  }

  const validateForm = () => {
    const errors = {};
    if (!newIssue.title.trim()) errors.title = 'タイトルは必須です';
    if (!newIssue.content.trim()) errors.content = '内容は必須です';
    if (!newIssue.limit) errors.limit = '期限は必須です';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      
      const issueData = {
        inputter_name: newIssue.inputter_name,
        priority: newIssue.priority,
        title: newIssue.title,
        content: newIssue.content,
        tag: newIssue.tag,
        limit: newIssue.limit
      };

      try {
        const headers = await getAuthHeaders();
        const response = await fetch('/api/register', {
          method: 'POST',
          headers,
          body: JSON.stringify(issueData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || '課題の作成に失敗しました');
        }

        const createdIssue = await response.json();
        
        // APIからのレスポンスに基づいて新しい課題を作成
        const newIssueFormatted = {
          id: createdIssue.id,
          create_date: createdIssue.issue?.create_date || formattedDate,
          username: createdIssue.issue?.username || issueData.inputter_name,
          urgency: createdIssue.issue?.urgency || issueData.priority,
          title: createdIssue.issue?.title || issueData.title,
          content: createdIssue.issue?.content || issueData.content,
          tag: createdIssue.issue?.tag || issueData.tag,
          limit: createdIssue.issue?.limit || issueData.limit,
          flg: createdIssue.issue?.flg || false
        };
        setIssues([newIssueFormatted, ...issues]);
        
        // 課題リストを再取得
        await fetchIssues();
        
      } catch (apiError) {
        console.warn('API request failed:', apiError);
        throw apiError;
      }

      setIsCreateMode(false);
      setNewIssue({
        inputter_name: user?.user_metadata?.display_name || '山田太郎',
        priority: PRIORITY.MEDIUM,
        title: '',
        content: '',
        tag: TAGS.DEVELOPMENT,
        limit: '',
      });
      setFormErrors({});
    } catch (error) {
      console.error('Failed to create issue:', error);
      setSubmitError(error.message || '課題の作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIssue(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleEditClick = () => {
    setEditedIssue({ ...selectedIssue });
    setIsEditMode(true);
  };

  const handleStatusToggle = async () => {
    try {
      const response = await fetch(`/api/update?id=${selectedIssue.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isResolve: !selectedIssue.flg
        }),
      });

      if (!response.ok) {
        throw new Error('状態の更新に失敗しました');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || '状態の更新に失敗しました');
      }

      const updatedIssue = {
        id: result.data.id,
        create_date: result.data.registration_date,
        username: result.data.Inputter_name,
        urgency: result.data.priority,
        title: result.data.title,
        content: result.data.content,
        tag: result.data.tag,
        limit: result.data.limit,
        flg: result.data.isResolve
      };

      const updatedIssues = issues.map(issue => 
        issue.id === selectedIssue.id ? updatedIssue : issue
      );
      setIssues(updatedIssues);
      setSelectedIssue(updatedIssue);
    } catch (error) {
      console.error('Failed to update issue status:', error);
      setSubmitError('状態の更新に失敗しました。もう一度お試しください。');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const updateData = {
        title: editedIssue.title,
        content: editedIssue.content,
        priority: editedIssue.urgency,
        tag: editedIssue.tag,
        limit_date: editedIssue.limit,
        inputter_name: editedIssue.username
      };

      const headers = await getAuthHeaders();
      const response = await fetch(`/api/update?id=${editedIssue.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '課題の更新に失敗しました');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '課題の更新に失敗しました');
      }

      const updatedIssues = issues.map(issue =>
        issue.id === editedIssue.id ? editedIssue : issue
      );
      setIssues(updatedIssues);
      setSelectedIssue(editedIssue);
      setIsEditMode(false);

      await fetchIssues();

    } catch (error) {
      console.error('Failed to update issue:', error);
      setSubmitError(error.message || '課題の更新に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedIssue(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredIssues = issues.filter(issue => {
    const statusMatch = filter === 'all' || 
      (filter === 'resolved' && issue.flg) || 
      (filter === 'unresolved' && !issue.flg);
    
    const tagMatch = selectedTag === 'all' || issue.tag === selectedTag;

    return statusMatch && tagMatch;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.create_date) - new Date(a.create_date);
    } else if (sortBy === 'oldest') {
      return new Date(a.create_date) - new Date(b.create_date);
    } else if (sortBy === 'priority') {
      const priorityOrder = { '高': 3, '中': 2, '低': 1 };
      return priorityOrder[b.urgency] - priorityOrder[a.urgency];
    }
    return 0;
  });

  if (isDetailMode && selectedIssue) {
    if (isEditMode) {
      return (
        <IssueForm
          issue={editedIssue}
          onSubmit={handleEditSubmit}
          onChange={handleEditInputChange}
          onCancel={() => setIsEditMode(false)}
          isSubmitting={isSubmitting}
          formErrors={formErrors}
          submitError={submitError}
          isEdit={true}
        />
      );
    }

    return (
      <IssueDetail
        issue={selectedIssue}
        onStatusToggle={handleStatusToggle}
        onEditClick={handleEditClick}
        onBackClick={() => setIsDetailMode(false)}
      />
    );
  }

  if (isCreateMode) {
    return (
      <IssueForm
        issue={newIssue}
        onSubmit={handleCreateIssue}
        onChange={handleInputChange}
        onCancel={() => setIsCreateMode(false)}
        isSubmitting={isSubmitting}
        formErrors={formErrors}
        submitError={submitError}
      />
    );
  }

  return (
    <div className={styles.container}>
      <Header
        user={user}
        onSignOut={signOut}
        onCreateClick={() => setIsCreateMode(true)}
      />
      
      <div className={styles.mainContent}>
        <Sidebar
          issues={issues}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
        />

        <IssueList
          issues={filteredIssues}
          filter={filter}
          sortBy={sortBy}
          onFilterChange={setFilter}
          onSortChange={setSortBy}
          onIssueClick={(issue) => {
            setSelectedIssue(issue);
            setIsDetailMode(true);
          }}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
