import { ApplicationInsights } from '@microsoft/applicationinsights-web'
const appInsights = new ApplicationInsights({ config: {
  connectionString: "InstrumentationKey=1ed14b85-2501-4762-a20e-1b8339da0cd5;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=a4b55d1c-c833-4ca9-869e-e4bf8d1ecd4e"
}});
appInsights.loadAppInsights();

import React from 'react';
import { load } from "@azure/app-configuration-provider";
import { FeatureManager, ConfigurationMapFeatureFlagProvider, ConfigurationObjectFeatureFlagProvider } from "@microsoft/feature-management";
import { createTelemetryPublisher } from "@microsoft/feature-management-applicationinsights-browser";
import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0);
  const [isBetaEnabled, setIsBetaEnabled] = useState(null);

  const fetchData = async () => {
    const appConfig = await load(
      "Endpoint=https://zhiyuanliang-test.azconfig-test.io;Id=c0EH;Secret=45T6yvK386A2UfVUFjNDGHDgTGzpsbWOWlt5Pvj5s9orLAS9jsGLJQQJ99AJADLArgHeHiRoAAACAZACTX4k",
      // "Endpoint=https://appconfig-lzy-dev.azconfig.io;Id=1IOH;Secret=90rsYJ0WOCQENkJVAhhjXE6f0DihG9EqAJA3UUIWIoKvqCzGVjJJJQQJ99AJAC3pKaRJhn2FAAACAZAC6iVX",
      {
        featureFlagOptions: {
          enabled: true,
          // Note: selectors must be explicitly provided for feature flags.
          selectors: [{
              keyFilter: "*"
          }]
        }
      }
    );
    console.log(appConfig.get("test"));
    // const ffp = new ConfigurationMapFeatureFlagProvider(appConfig);

    const jsonConfig = {
      "feature_management": {
          "feature_flags": [
            {
              "id": "Beta",
              "enabled": true,
              "telemetry": {
                "enabled": true
              }
            }
          ]
      }
    };
    const ffp = new ConfigurationObjectFeatureFlagProvider(jsonConfig);

    const sendTelemetry = createTelemetryPublisher(appInsights);
    const fm = new FeatureManager(
      ffp,
      {onFeatureEvaluated: sendTelemetry}
    );
  
    setIsBetaEnabled(await fm.isEnabled("Beta"));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <div>
        <p>Beta feature flag is {isBetaEnabled === null ? 'loading...' : isBetaEnabled ? 'enabled' : 'disabled'}.</p>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
