- Remember to manually disable request tracing for js provider.
- userb@contoso.com can get the "On" variant
- logout to trigger dynamic refresh

On 
test
someone
usera@contoso.com
userb@contoso.com
matt
jm

Off
user@contoso.com
zhiyuanliang
charles
jimmy
ross
zhenlan

let FeatureEvaluations = customEvents
    | where name == "FeatureEvaluation"
    | extend TargetingId = tostring(customDimensions.TargetingId),
             Variant = tostring(customDimensions.Variant)
    | distinct TargetingId, Variant;

let LikedTargetingIds = customEvents
    | where name == "Like"
    | extend TargetingId = tostring(customDimensions.TargetingId)
    | distinct TargetingId;

let FeatureEvaluationsWithLikeFlag = FeatureEvaluations
    | extend HasLike = iff(TargetingId in (LikedTargetingIds), 1, 0);

FeatureEvaluationsWithLikeFlag
| summarize 
    TotalTargetingIds = count(),
    LikedTargetingIds = sum(HasLike)
    by Variant
| extend LikeRatio = todouble(LikedTargetingIds) / todouble(TotalTargetingIds)


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

