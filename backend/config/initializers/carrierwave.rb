CarrierWave.configure do |config|
  if Rails.env.production?
    # 本番環境用の設定 (S3など)
    config.fog_provider = 'fog/aws'
    config.fog_credentials = {
      provider: 'AWS',
      aws_access_key_id: ENV['AWS_ACCESS_KEY_ID'],
      aws_secret_access_key: ENV['AWS_SECRET_ACCESS_KEY'],
      region: ENV['AWS_REGION']
    }
    config.fog_directory  = ENV['S3_BUCKET_NAME']
    config.asset_host = "https://#{ENV['S3_BUCKET_NAME']}.s3.amazonaws.com"
  else
    # 開発環境用の設定 (ローカル)
    config.storage = :file
    config.asset_host = "http://localhost:3000"
    config.enable_processing = Rails.env.development?
  end
end
