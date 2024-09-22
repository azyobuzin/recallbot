FROM public.ecr.aws/lambda/nodejs:20 AS builder
WORKDIR ${LAMBDA_TASK_ROOT}
COPY . .
# Compile TypeScript into one JavaScript file
RUN ESBUILD_VERSION=$(awk 'match($0, /"esbuild": "([^"]+)"/, arr) { print arr[1] }' package.json) && \
    npx -y esbuild@${ESBUILD_VERSION} index.ts --bundle --outfile=index.mjs --platform=node --format=esm --packages=external

FROM public.ecr.aws/lambda/nodejs:20
WORKDIR ${LAMBDA_TASK_ROOT}
ENV NODE_ENV=production
COPY package.json package-lock.json .
RUN npm ci
COPY --from=builder ${LAMBDA_TASK_ROOT}/index.mjs .
CMD ["index.handler"]
