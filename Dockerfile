# Dummy Dockerfile
# This is just needed to trigger rebuilds of the complete twister image via the Docker registry hub.
FROM busybox
ADD . /twister-html
