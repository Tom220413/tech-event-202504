-- ユーザープロファイルテーブル（Supabase Authと連携）
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 課題テーブル
CREATE TABLE public.issues (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 30),
  content TEXT NOT NULL CHECK (char_length(content) <= 225),
  priority TEXT NOT NULL CHECK (priority IN ('高', '中', '低')),
  tag TEXT NOT NULL CHECK (tag IN ('開発', 'デザイン', 'ドキュメント', 'インフラ', 'その他')),
  limit_date DATE NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  inputter_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) ポリシー設定
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- プロファイルのポリシー
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 課題のポリシー
CREATE POLICY "Users can view own issues" ON public.issues
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own issues" ON public.issues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own issues" ON public.issues
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own issues" ON public.issues
  FOR DELETE USING (auth.uid() = user_id);

-- インデックス作成
CREATE INDEX idx_issues_user_id ON public.issues(user_id);
CREATE INDEX idx_issues_created_at ON public.issues(created_at);
CREATE INDEX idx_issues_priority ON public.issues(priority);
CREATE INDEX idx_issues_is_resolved ON public.issues(is_resolved);

-- プロファイル自動作成のトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at(); 