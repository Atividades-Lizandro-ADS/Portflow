import json

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = 'Verifica conexão com MinIO e garante que o bucket existe'

    def handle(self, *args, **options):
        client = boto3.client(
            's3',
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            config=Config(signature_version='s3v4'),
            region_name='us-east-1',
        )

        bucket = settings.AWS_STORAGE_BUCKET_NAME

        try:
            client.head_bucket(Bucket=bucket)
            self.stdout.write(self.style.SUCCESS(f'MinIO: bucket "{bucket}" verificado'))
        except ClientError:
            # Fallback: cria o bucket e aplica policy se o minio-setup não rodou
            client.create_bucket(Bucket=bucket)
            policy = {
                'Version': '2012-10-17',
                'Statement': [{
                    'Effect': 'Allow',
                    'Principal': {'AWS': ['*']},
                    'Action': ['s3:GetObject'],
                    'Resource': [f'arn:aws:s3:::{bucket}/*'],
                }]
            }
            client.put_bucket_policy(Bucket=bucket, Policy=json.dumps(policy))
            self.stdout.write(self.style.WARNING(
                f'MinIO: bucket "{bucket}" criado (CORS deve ser configurado via minio-setup)'
            ))
