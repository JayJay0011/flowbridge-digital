update storage.buckets
set
  public = true,
  file_size_limit = 83886080,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
where id = 'public-assets';
