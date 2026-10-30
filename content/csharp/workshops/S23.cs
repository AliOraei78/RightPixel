using System.Diagnostics;

using var listener = new ActivityListener
{
    ShouldListenTo = source => source.Name == "course",
    Sample = (ref ActivityCreationOptions<ActivityContext> _) => ActivitySamplingResult.AllData
};
ActivitySource.AddActivityListener(listener);

using var source = new ActivitySource("course");
using var activity = source.StartActivity("order");
activity?.SetTag("order.id", 42);
Console.WriteLine(activity is not null);
