# Use the official Azure Functions Node.js image
# This image includes the Azure Functions runtime and Node.js
FROM mcr.microsoft.com/azure-functions/node:4-node18-appservice

# Set environment variables
# AzureWebJobsScriptRoot is the path that the Azure Functions runtime uses to find your function app
# AzureFunctionsJobHost__Logging__Console__IsEnabled enables console logging in the Azure Functions runtime
ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

# Copy all files from the current directory to /home/site/wwwroot in the image
COPY . /home/site/wwwroot

# Change the working directory to /home/site/wwwroot and install npm packages
# The --only=production flag ensures that devDependencies are not installed
RUN cd /home/site/wwwroot && \
    npm install --only=production

# Expose port 80 for the app to listen on
EXPOSE 80

# Start the Azure Functions runtime
# This command is run when a container is started from the image
CMD func start