let isScheduled = false;
const jobs = [];

export function enqueueJob(job) {
    jobs.push(job);
    scheduleUpdate();
}

function scheduleUpdate() {
    if (isScheduled) {
        return;
    }

    isScheduled = true;
    queueMicrotask(processJobs);
}

function processJobs() {
    while (jobs.length > 0) {
        const job = jobs.shift();
        const result = job();
        Promise.resolve(result)
            .then(() => {

            }, (err) => {
                console.error(`[scheduler] Uncaught error in job: ${err.message}`);
            })
        job();
    }

    isScheduled = false;
}
