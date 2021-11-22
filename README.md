# Terraform S3 Backend Action

This GitHub Action allows you to conveniently generate a backend configuration file used to initialize any Terraform
remote backend (.tfstate) hosted in an S3 bucket of any AWS account that has authorized your GitHub repository via an
IAM OIDC role.

[More information on GitHub-AWS OIDC integration](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)

### Usage:

```yaml
- id: backend-config
  uses: amannm/terraform-s3-backend-action@v1
  with:
    account-id: "0123456789"
    region: "us-east-1"
    role: "github-actions@my-username.my-repository"
    bucket: "my-hosted-terraform-state-bucket"
    key: "my-username/my-repository/terraform.tfstate"
- run: |
    terraform init -backend-config="${{ steps.backend-config.outputs.path }}"
```

Compared to the [aws-configure-credentials](https://github.com/aws-actions/configure-aws-credentials) GitHub Action, the
approach here is focused only on OIDC-based credential procurement and affords proper isolation of credentials from the
remaining the workflow steps in the job. It avoids exporting or influencing global state (e.g. setting the "AWS_*"
series of environment variables).

Instead, it cleanly generates only the backend configuration file used in:

```
terraform init -backend-config="/path/to/backend.conf"
```

This allows you to, within the same job, use a backend hosted on a different AWS account than the one you're running
Terraform for in the workflow.
