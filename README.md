
#### Step 1: Pre-requisites

In Azure portal create the following resources
* a resource group
* a storage account with Hierarchical namespace enabled 
  * in the storage account create a container with a directory as per your `index.json` (or vice versa)
  * don't create the storage account as part of setting up the Function App. It will not give you the option to "Add Directory"
* a Container registry
* Application Insights
* App Service Plan with pricing plan `Basic B1`
* Function App 
  * for deployment select `Container Image`
  * select `App service plan` created above
  * Note: this will create a function app with a quick start default docker image. We will need to point this to our docker image in later steps (see below).

#### Step 2

```
 mkdir wp-docker-azfunc && cd wp-docker-azfunc
 func init . --docker
 func new
```

#### Step 3

* in `function.json` replace `"authLevel": "req",` by `"authLevel": "anonymous",`
* update `index.json` and `packages.json` as needed
* IMPORTANT: in both `packages.json` ensure to have
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

Assuming you have the Dashboard already setup with existing Web Data sources defined but you need to update them.

* Go to Transform Data > Data Source Settings and update using these URL's
  * https://housedashboardapp.azurewebsites.net/api/read_transactions/homedashdata
  * https://housedashboardapp.azurewebsites.net/api/read_transactions_other/homedashdata



