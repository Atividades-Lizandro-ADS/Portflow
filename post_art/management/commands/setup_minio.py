import json
import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Cria o bucket no MinIO e configura política de leitura pública'

    def handle(self, *args, **options):
        s3 = boto3.client(
            's3',
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )
        bucket = settings.AWS_STORAGE_BUCKET_NAME

        try:
            s3.create_bucket(Bucket=bucket)
            self.stdout.write(f'Bucket "{bucket}" criado.')
        except ClientError as e:
            code = e.response['Error']['Code']
            if code in ('BucketAlreadyOwnedByYou', 'BucketAlreadyExists'):
                self.stdout.write(f'Bucket "{bucket}" já existe.')
            else:
                self.stderr.write(self.style.ERROR(str(e)))
                return

        policy = json.dumps({
            'Version': '2012-10-17',
            'Statement': [{
                'Effect': 'Allow',
                'Principal': {'AWS': ['*']},
                'Action': ['s3:GetObject'],
                'Resource': [f'arn:aws:s3:::{bucket}/*'],
            }],
        })
        s3.put_bucket_policy(Bucket=bucket, Policy=policy)
        self.stdout.write(self.style.SUCCESS(
            f'Bucket "{bucket}" pronto com leitura pública.'
        ))
