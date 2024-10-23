import { ApplicationInsights } from '@microsoft/applicationinsights-web'
const appInsights = new ApplicationInsights({ config: {
  connectionString: "InstrumentationKey=1ed14b85-2501-4762-a20e-1b8339da0cd5;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=a4b55d1c-c833-4ca9-869e-e4bf8d1ecd4e"
}});
appInsights.loadAppInsights();

import React from 'react';
import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { load } from "@azure/app-configuration-provider";
import { FeatureManager, ConfigurationMapFeatureFlagProvider, ConfigurationObjectFeatureFlagProvider } from "@microsoft/feature-management";
import { createTelemetryPublisher } from "@microsoft/feature-management-applicationinsights-browser";

function Home() {
  const [liked, setLiked] = useState(false);

  const [variant, setVariant] = useState(undefined);
  const fetchData = async () => {
    const appConfig = await load(
      "Endpoint=https://appconfig-lzy-dev.azconfig.io;Id=1IOH;Secret=90rsYJ0WOCQENkJVAhhjXE6f0DihG9EqAJA3UUIWIoKvqCzGVjJJJQQJ99AJAC3pKaRJhn2FAAACAZAC6iVX",
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

    const ffp = new ConfigurationMapFeatureFlagProvider(appConfig);
    const sendTelemetry = createTelemetryPublisher(appInsights);
    const fm = new FeatureManager(
      ffp,
      {onFeatureEvaluated: sendTelemetry}
    );
  
    setVariant(await fm.getVariant("Greeting"));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClick = () => {
    setLiked(!liked); // Toggle liked state
  };

  return (
    <div className="quote-card">
      <p>Variant is {variant === undefined ? 'loading...' : variant.name}.</p>
      <h2>
        Hi <b>Guest</b>, hope this makes your day!
      </h2>
      <blockquote>
        <p>"You cannot change what you are, only what you do."</p>
        <footer>— Philip Pullman</footer>
      </blockquote>

      <div className="vote-container">
        <button className="heart-button" onClick={handleClick}>
          {liked ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

    </div>
  );
}

export default Home;