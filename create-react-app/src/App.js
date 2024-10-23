import { ApplicationInsights } from '@microsoft/applicationinsights-web'
const appInsights = new ApplicationInsights({ config: {
  connectionString: "InstrumentationKey=1ed14b85-2501-4762-a20e-1b8339da0cd5;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=a4b55d1c-c833-4ca9-869e-e4bf8d1ecd4e"
}});
appInsights.loadAppInsights();

import logo from './logo.svg';
import './App.css';

import { load } from "@azure/app-configuration-provider";
import { FeatureManager, ConfigurationObjectFeatureFlagProvider } from "@microsoft/feature-management";
import { createTelemetryPublisher } from "@microsoft/feature-management-applicationinsights-browser";
import { useEffect, useState } from 'react';

function App() {
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
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <p>Beta feature flag is {isBetaEnabled === null ? 'loading...' : isBetaEnabled ? 'enabled' : 'disabled'}.</p>
        </div>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
