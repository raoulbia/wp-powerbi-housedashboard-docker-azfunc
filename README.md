# Azure Function Deployment with Docker

This project provides a guide and necessary scripts for deploying an Azure Function using a Docker container. The Azure Function is designed to work with various Azure resources including a resource group, a storage account, a container registry, Application Insights, and an App Service Plan. 

The project includes steps to initialize the function app with Docker, configure the function app, build and push the Docker image, and deploy the image to the function app. The guide also provides optional steps for manual deployment settings and updating PowerBI if necessary.

This project is ideal for developers who want to leverage the power of Azure Functions and Docker for their applications. It provides a streamlined process for setting up and deploying an Azure Function, making it easier to manage and scale your applications.

## Step 1: Pre-requisites

Create the following resources in the Azure portal:

- A resource group
- A storage account with Hierarchical namespace enabled. In the storage account, create a container with a directory as per your `index.json` (or vice versa). Do not create the storage account as part of setting up the Function App, as it will not give you the option to "Add Directory".
- A Container registry
- Application Insights
- App Service Plan with pricing plan `Basic B1`
- Function App. For deployment, select `Container Image` and the `App service plan` created above. Note: this will create a function app with a quick start default docker image. We will need to point this to our docker image in later steps.

## Step 2: Initialize Function App

Navigate to your desired directory and initialize the function app with Docker.

```bash
mkdir wp-docker-azfunc && cd wp-docker-azfunc
func init . --docker
func new
```

#### Step 3

* in `function.json` replace `"authLevel": "req",` by `"authLevel": "function",`
* IMPORTANT: in both `function.json` files ensure to have
  * "scriptFile": "index.js"
  * specific route for each e.g. `"route": "read_transactions/homedashdata",` and `"route": "read_transactions_other/homedashdata",` resp.


#### Step 4

In the present case, the name of the Container registry is `housedashboard` and the name of the repository within the registry is `dockerapp`.

```
docker build -t housedashboard.azurecr.io/dockerapp:v1 .
docker login housedashboard.azurecr.io
docker push housedashboard.azurecr.io/dockerapp:v1

```

to deploy to your container-enabled function app:

```
az functionapp config container set 
--name housedashboardapp 
--resource-group rg-dashboard 
--docker-custom-image-name housedashboard.azurecr.io/dockerapp:v3 
--docker-registry-server-url https://housedashboard.azurecr.io --docker-registry-server-user housedashboard --docker-registry-server-password <PASSWORD>
```
Note: to get the password for the ACR login above use `az acr credential show --name housedashboard.azurecr.io`

#### Step 5 (Optional)

THe last step above (deployment to function app) will automatically update the settings discussed below. However in case you need to do it manually for whatever reason, follow the instructions that below.

Go to function app in Azure portal, then under "Deployment" > " Deployment Center"

* select your registry from drop down menu
* enter your image name and tag
  * e.g. for `docker push housedashboard.azurecr.io/dockerapp:v1` image is the name of the repository `dockerapp` and tag is `v1`
* Save (this will automatically restart the app)

#### Finally, in PowerBI

1. In PowerBI, go to Home > Get Data > Web.
2. In the URL box, enter your Azure Function URL: https://<your-function-app>.azurewebsites.net/api/<your-function-name>
3. Click on the "Advanced" button.
4. In the "HTTP request header parameters" section, add a new parameter:
   Name: `x-functions-key`
   Value: `<your-function-key>`
5. Click OK to load the data.

This way, you're passing the function key in the header of the HTTP request, which is more secure than appending it to the URL.

You can get the function key from the Azure portal. Here are the steps:

1. Navigate to the Azure portal (https://portal.azure.com/).
2. Go to your Function App.
3. Expand the Functions menu on the left side and click on your function.
4. Click on the "Manage" tab.
5. Under Function Keys, you'll see the default key.

Configure two PowerBI Web Data sources with the following URL's:

  * https://housedashboardapp.azurewebsites.net/api/read_transactions/homedashdata
  * https://housedashboardapp.azurewebsites.net/api/read_transactions_other/homedashdata




