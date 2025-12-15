import { Job } from "./jobs";
import { Gig } from "./gigs";
import { JobApplication } from "./jobApplication";
import { JobMilestone } from "./jobMilestone";
import { Bid } from "./bid";

export interface BidWithJob extends Bid {
    job: Job;
}

export interface ProjectInfoContextType {
    jobsInfo: Job[];
    gigsInfo: Gig[];
    bidsInfo: BidWithJob[];
    jobApplicationsInfo: JobApplication[];
    jobMilestonesInfo: JobMilestone[];
    setJobsInfo: React.Dispatch<React.SetStateAction<Job[]>>;
    setGigsInfo: React.Dispatch<React.SetStateAction<Gig[]>>;
    setBidsInfo: React.Dispatch<React.SetStateAction<BidWithJob[]>>;
    setJobApplicationsInfo: React.Dispatch<React.SetStateAction<JobApplication[]>>;
    setJobMilestonesInfo: React.Dispatch<React.SetStateAction<JobMilestone[]>>;
    projectInfoError: string;
    setProjectInfoError: React.Dispatch<React.SetStateAction<string>>;
}