import { createServerClient } from '@/lib/supabase/server';
import type { Media } from './types';

export async function getAllMedia(): Promise<Media[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[DB Media] getAllMedia error:', error);
    return [];
  }

  return data || [];
}

export async function getMediaById(id: string): Promise<Media | null> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') {
      console.error('[DB Media] getMediaById error:', error);
    }
    return null;
  }

  return data;
}

export async function uploadMedia(file: File, altText?: string): Promise<Media> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to upload media');
  }

  // Create unique filename path
  const ext = file.name.split('.').pop() || 'bin';
  const fileHash = Math.random().toString(36).substring(2, 10);
  const sanitizeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `${user.id}/${Date.now()}_${fileHash}_${sanitizeName}`;

  // 1. Upload to Supabase Storage 'media' bucket
  const fileBuffer = await file.arrayBuffer();
  const { data: storageData, error: storageError } = await supabase
    .storage
    .from('media')
    .upload(storagePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (storageError) {
    console.error('[DB Media] Storage upload error:', storageError);
    throw new Error(`Storage upload failed: ${storageError.message}`);
  }

  // 2. Get Public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('media')
    .getPublicUrl(storagePath);

  // 3. Save DB record
  const { data: dbData, error: dbError } = await supabase
    .from('media')
    .insert({
      filename: file.name,
      storage_path: storagePath,
      public_url: publicUrl,
      alt_text: altText || file.name,
      mime_type: file.type,
      size: file.size,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (dbError) {
    console.error('[DB Media] Database record creation error:', dbError);
    // Cleanup storage file on DB failure
    await supabase.storage.from('media').remove([storagePath]);
    throw new Error(`Database error saving media metadata: ${dbError.message}`);
  }

  return dbData;
}

export async function deleteMedia(id: string): Promise<boolean> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to delete media');
  }

  // 1. Get media record to find storage_path
  const media = await getMediaById(id);
  if (!media) {
    throw new Error('Media file not found');
  }

  // 2. Remove from Supabase Storage bucket
  if (media.storage_path) {
    const { error: storageErr } = await supabase
      .storage
      .from('media')
      .remove([media.storage_path]);

    if (storageErr) {
      console.warn('[DB Media] Storage removal warning:', storageErr.message);
    }
  }

  // 3. Remove DB record
  const { error: dbErr } = await supabase
    .from('media')
    .delete()
    .eq('id', id);

  if (dbErr) {
    console.error('[DB Media] Database deletion error:', dbErr);
    throw new Error(`Failed to delete media record: ${dbErr.message}`);
  }

  return true;
}
