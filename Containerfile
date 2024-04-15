FROM registry.access.redhat.com/ubi9/ubi:9.3

ARG GIT_REPO=https://github.com/Demo-AI-Edge-Crazy-Train/train-controller.git \
    GIT_REF=main

RUN dnf update -y \
 && dnf install -y --setopt=install_weak_deps=false nodejs npm \
 && dnf install -y git make gcc g++ shadow-utils \
 && git clone "$GIT_REPO" -b "$GIT_REF" /opt/app \
 && cd /opt/app && npm install \
 && useradd -d /opt/app nodejs \
 && chown -R nodejs:nodejs /opt/app \
 && dnf remove -y git make gcc g++ shadow-utils \
 && dnf clean -y all

USER nodejs
WORKDIR /opt/app
ENTRYPOINT [ "/usr/bin/node" ]
CMD [ "index.js" ]
