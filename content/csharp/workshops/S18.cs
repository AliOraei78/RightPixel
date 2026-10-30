var jobs = new PriorityQueue<string, int>();
jobs.Enqueue("normal", 10);
jobs.Enqueue("urgent", 1);

while (jobs.TryDequeue(out string? job, out _))
    Console.WriteLine(job);
