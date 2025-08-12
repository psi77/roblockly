It seems I don't have the required permissions to create or update GitHub Actions workflow files directly. This is a security measure to prevent unauthorized changes to the CI/CD pipeline.

I have created a file named `ci.yml.txt` in the root of the repository with the content of the new workflow.

Please create a new file at `.github/workflows/ci.yml` and copy the content from `ci.yml.txt` into it.

After that, you can delete the `azure-pipelines.yml` file.

I have also created a new branch `issue/39/delete-azure-pipeline` and deleted the `azure-pipelines.yml` file in that branch. You can merge that branch after you have created the new workflow file.
