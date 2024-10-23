import { ApplicationInsights } from '@microsoft/applicationinsights-web'

import React from 'react';
import { createContext, useState, useEffect } from 'react';
import { load } from "@azure/app-configuration-provider";
import { FeatureManager, ConfigurationMapFeatureFlagProvider } from "@microsoft/feature-management";
import { createTelemetryPublisher } from "@microsoft/feature-management-applicationinsights-browser";

export const AppContext = createContext();

export const ContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [config, setConfig] = useState(undefined);
  const [featureManager, setFeatureManager] = useState(undefined);
  const appInsights = new ApplicationInsights({ config: {
    connectionString: "InstrumentationKey=1ed14b85-2501-4762-a20e-1b8339da0cd5;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=a4b55d1c-c833-4ca9-869e-e4bf8d1ecd4e"
  }});
  appInsights.loadAppInsights();

  useEffect(() => {
    const init = async () => {
      const appConfig = await load(
        "Endpoint=https://appconfig-lzy-dev.azconfig.io;Id=1IOH;Secret=90rsYJ0WOCQENkJVAhhjXE6f0DihG9EqAJA3UUIWIoKvqCzGVjJJJQQJ99AJAC3pKaRJhn2FAAACAZAC6iVX",
        {
          featureFlagOptions: {
            enabled: true,
            selectors: [{
                keyFilter: "*"
            }],
            refresh: {
              enabled: true,
              refreshIntervalInMs: 10_000
            }
          }
        }
      );
      setConfig(appConfig);
  
      const fm = new FeatureManager(
        new ConfigurationMapFeatureFlagProvider(appConfig),
        {onFeatureEvaluated: createTelemetryPublisher(appInsights)}
      );
      setFeatureManager(fm);
    };

    init();
  }, []);

  const loginUser = (user) => {
    setCurrentUser(user);
    config.refresh();
  };

  const logoutUser = () => {
    setCurrentUser(undefined);
    config.refresh();
  };

  return (
    <AppContext.Provider value={{ appInsights, config, featureManager, currentUser, loginUser, logoutUser }}>
      {children}
    </AppContext.Provider>
  );
};