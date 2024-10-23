- Remember to manually disable request tracing for js provider.
- userb@contoso.com can get the "On" variant
- logout to trigger dynamic refresh

customEvents
| where name == "FeatureEvaluation"
| project TargetingId = tostring(customDimensions.TargetingId), Variant = tostring(customDimensions.Variant)
| join (
    customEvents
    | where name == "Like"
    | project TargetingId = tostring(customDimensions.TargetingId)
  ) on TargetingId
| project TargetingId, Variant
| summarize LikesCount = count() by Variant