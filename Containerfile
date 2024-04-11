FROM registry.access.redhat.com/ubi9/nodejs-18

USER root

# Update base image for latest security updates
# (ubi images are not released that often)
RUN dnf -y  --setopt=tsflags=nodocs update && \
    dnf -y clean all --enablerepo='*' && \
    yarn global add tslint typescript

# RUN dnf -y install --allowerasing curl gpg && \
#     curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo && \
#     curl --silent --location https://rpm.nodesource.com/setup_14.x | bash - && \
#     dnf -y install nodejs yarn && \
#     dnf clean all && \
#     yarn global add tslint typescript

# Copying in source code
COPY --chown=1001:0 . /tmp/src

USER 1001
# Assemble script sourced from builder image based on user input or image metadata.
# If this file does not exist in the image, the build will fail.
RUN /usr/libexec/s2i/assemble
# Run script sourced from builder image based on user input or image metadata.
# If this file does not exist in the image, the build will fail.
CMD /usr/libexec/s2i/run