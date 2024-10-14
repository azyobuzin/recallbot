FROM public.ecr.aws/lambda/nodejs:20 AS builder
RUN dnf -y install jq && dnf clean all
WORKDIR ${LAMBDA_TASK_ROOT}
COPY . .
# Compile TypeScript into one JavaScript file
RUN ESBUILD_VERSION=$(jq -r '.devDependencies.esbuild' package.json) && \
    npx -y --package=esbuild@${ESBUILD_VERSION} -- $(jq -r '.scripts.build' package.json)

FROM public.ecr.aws/lambda/nodejs:20
WORKDIR ${LAMBDA_TASK_ROOT}
ENV NODE_ENV=production
COPY package.json package-lock.json .
RUN npm ci
COPY --from=builder ${LAMBDA_TASK_ROOT}/index.mjs .
CMD ["index.handler"]
