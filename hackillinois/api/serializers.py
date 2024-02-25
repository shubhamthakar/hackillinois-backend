# serializers.py
from rest_framework import serializers

class GitHubURLSerializer(serializers.Serializer):
    github_url = serializers.URLField()
    coding_language = serializers.CharField()
    language_version = serializers.CharField()
