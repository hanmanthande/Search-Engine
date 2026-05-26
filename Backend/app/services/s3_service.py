import logging
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from app.config import (
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    S3_UPLOADS_BUCKET,
    S3_UPLOADS_PREFIX,
)
 
logger = logging.getLogger(__name__)
 
 
def _get_client():
    """
    Returns a boto3 S3 client.
    On EC2 with an IAM instance role, no keys are needed — boto3 picks them up automatically.
    Locally or without a role, uses AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY from .env.
    """
    kwargs = {"region_name": AWS_REGION}
    if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
        kwargs["aws_access_key_id"]     = AWS_ACCESS_KEY_ID
        kwargs["aws_secret_access_key"] = AWS_SECRET_ACCESS_KEY
    return boto3.client("s3", **kwargs)
 
 
def upload_file_to_s3(file_bytes: bytes, object_key: str, content_type: str) -> str:
    """
    Uploads raw bytes to S3.
    Returns the full S3 key (e.g. 'uploads/uuid.pdf').
    Raises RuntimeError on failure.
    """
    try:
        client = _get_client()
        full_key = f"{S3_UPLOADS_PREFIX}/{object_key}"
        client.put_object(
            Bucket=S3_UPLOADS_BUCKET,
            Key=full_key,
            Body=file_bytes,
            ContentType=content_type,
        )
        logger.info("Uploaded %s to s3://%s/%s", object_key, S3_UPLOADS_BUCKET, full_key)
        return full_key
    except NoCredentialsError:
        logger.error("AWS credentials not found")
        raise RuntimeError("AWS credentials not configured. Set AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY or use an IAM role.")
    except ClientError as e:
        logger.error("S3 upload failed: %s", e)
        raise RuntimeError(f"S3 upload failed: {e.response['Error']['Message']}")
 
 
def download_file_from_s3(s3_key: str) -> bytes:
    """Downloads a file from S3 and returns raw bytes."""
    try:
        client = _get_client()
        response = client.get_object(Bucket=S3_UPLOADS_BUCKET, Key=s3_key)
        return response["Body"].read()
    except ClientError as e:
        logger.error("S3 download failed for key %s: %s", s3_key, e)
        raise RuntimeError(f"S3 download failed: {e.response['Error']['Message']}")
 
 
def generate_presigned_url(s3_key: str, expires_in: int = 3600) -> str:
    """
    Generates a presigned URL to temporarily expose a private S3 object.
    Default expiry: 1 hour.
    """
    try:
        client = _get_client()
        url = client.generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_UPLOADS_BUCKET, "Key": s3_key},
            ExpiresIn=expires_in,
        )
        return url
    except ClientError as e:
        logger.error("Failed to generate presigned URL for %s: %s", s3_key, e)
        raise RuntimeError(f"Presigned URL generation failed: {e.response['Error']['Message']}")
 
 
def delete_file_from_s3(s3_key: str) -> None:
    """Deletes a file from S3."""
    try:
        client = _get_client()
        client.delete_object(Bucket=S3_UPLOADS_BUCKET, Key=s3_key)
        logger.info("Deleted s3://%s/%s", S3_UPLOADS_BUCKET, s3_key)
    except ClientError as e:
        logger.error("S3 delete failed for %s: %s", s3_key, e)
        raise RuntimeError(f"S3 delete failed: {e.response['Error']['Message']}")