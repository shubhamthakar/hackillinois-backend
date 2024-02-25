# views.py
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view

from django.http import JsonResponse
from .serializers import GitHubURLSerializer
from .forms import GitHubURLForm
import socket
import docker
import requests

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    ip_address = s.getsockname()[0]
    return ip_address

def get_port():
    sock = socket.socket()
    sock.bind(('', 0))
    port = sock.getsockname()[1]
    port_mappings = {
        "3000/tcp": port
    }
    return port, port_mappings

@api_view(['POST'])
@csrf_exempt
def generate_url(request):
    print(request.data)
    print(request.method)
    if request.method == 'POST':
        serializer = GitHubURLSerializer(data=request.data)
        if serializer.is_valid():
            github_url = serializer.validated_data['github_url']
            coding_language = serializer.validated_data['coding_language']
            language_version = serializer.validated_data['language_version']
            port, port_mappings = get_port()
            client = docker.from_env()
            if coding_language=="react":
                build_args = {'REPO_URL': github_url}
                dockerfile_path = './api/docker-files'
                image, build_logs = client.images.build(path=dockerfile_path, tag='react_image', buildargs=build_args)
                print(f"Build image id is {build_logs}")
                print(f"Build image id is {image.id}")
                container = client.containers.run(image.id, detach=True, ports=port_mappings)
                print(f"Container started id is:{container}")
                if container.status == "exited":
                    return JsonResponse({'error_log': container.logs()}, status=400)
                else:
                    ip_add = get_ip()
                    generated_url = f"{ip_add}:{port}"
            elif coding_language=="django":
                pass
            elif coding_language=="flask":
                pass
            
            url = f'http://localhost:3030'  # Replace this with your Node.js server URL
            data = {'container_id': container.id}
            response = requests.post(url, json=data)
            return JsonResponse({'generated_url': generated_url}, status=200)
        else:
            return JsonResponse(serializer.errors, status=400)
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)



#python react or what
#run docker container
#how to share link with user (HOST=0.0.0.0 npm start)
#Which port to run the service on
#
    

