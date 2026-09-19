# Dockerfile ligero para Proyecto David (Flutter Linux/Web y Tests)
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    unzip \
    xz-utils \
    zip \
    libglu1-mesa \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV FLUTTER_HOME=/opt/flutter
ENV PATH="${FLUTTER_HOME}/bin:${FLUTTER_HOME}/bin/cache/dart-sdk/bin:${PATH}"

# Descargar Flutter SDK oficial directamente (sin Android SDK redundante)
RUN curl -s https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.5-stable.tar.xz | tar -xJ -C /opt \
    && git config --global --add safe.directory /opt/flutter \
    && flutter config --no-analytics --enable-web

WORKDIR /app
CMD ["flutter", "test"]

