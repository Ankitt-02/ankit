import { createServerClient } from '@/lib/supabase/server';
import type { Profile, ProfileInput } from './types';

export async function getCurrentUserProfile(): Promise<Profile | null> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[DB Profiles] getCurrentUserProfile error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[DB Profiles] getCurrentUserProfile catch:', err);
    return null;
  }
}

export async function getPublicProfile(): Promise<Profile | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
      if (error && attempt === 1) {
        console.error('[DB Profiles] getPublicProfile error:', error);
      }
    } catch (err) {
      if (attempt === 1) {
        console.error('[DB Profiles] getPublicProfile catch:', err);
      }
    }
  }
  return null;
}

export async function updateProfile(input: ProfileInput): Promise<Profile> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to update profile');
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      name: input.name !== undefined ? input.name : undefined,
      email: input.email !== undefined ? input.email : user.email,
      bio: input.bio !== undefined ? input.bio : undefined,
      headline: input.headline !== undefined ? input.headline : undefined,
      avatar_url: input.avatar_url !== undefined ? input.avatar_url : undefined,
      resume_url: input.resume_url !== undefined ? input.resume_url : undefined,
      education: input.education !== undefined ? input.education : undefined,
      detailed_bio: input.detailed_bio !== undefined ? input.detailed_bio : undefined,
      engineering_interests: input.engineering_interests !== undefined ? input.engineering_interests : undefined,
      personal_interests: input.personal_interests !== undefined ? input.personal_interests : undefined,
      website: input.website !== undefined ? input.website : undefined,
      github: input.github !== undefined ? input.github : undefined,
      linkedin: input.linkedin !== undefined ? input.linkedin : undefined,
      instagram: input.instagram !== undefined ? input.instagram : undefined,
      twitter: input.twitter !== undefined ? input.twitter : undefined,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[DB Profiles] updateProfile error:', error);
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return data;
}
