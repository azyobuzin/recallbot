FROM public.ecr.aws/lambda/nodejs:20
WORKDIR ${LAMBDA_TASK_ROOT}
ENV NODE_ENV=production
COPY . .
RUN npm ci
CMD ["app.handler"]
