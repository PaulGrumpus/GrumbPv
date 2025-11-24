import SectionPlaceholder from "./sectionPlaceholder";
import Button from "../button";
import UserJobOrGigPost from "../userJobOrGigPost";

const Jobs = [
    {
        title: "Job 1",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        subtitle: "Subtitle 1",
        tags: ["Tag 1"],
    },
    {
        title: "Job 2",
        image: "/Grmps/profile-image.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        subtitle: "Subtitle 2",
        tags: ["Tag 1"],
    },
    {
        title: "Job 3",
        description: "DescLorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        subtitle: "Subtitle 3",
        tags: ["Tag 1"],
    },
]

const MyJobsSection = () => {
    return (
        <div>
            <SectionPlaceholder
                title="My Jobs"
                description="Track and manage all the jobs you have published."
            />
            {Jobs.length > 0 ? (
                <div>
                    <div className="flex justify-end">
                        <div className="w-45 mb-8 flex justify-end">
                            <Button
                                padding='px-7 py-3'
                            >
                                <p className='text-normal font-regular'>+ Create Job</p>
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        {Jobs.map((job) => (
                            <UserJobOrGigPost
                                key={job.title}
                                title={job.title}
                                description={job.description}
                                subtitle={job.subtitle}
                                tags={job.tags}
                                image={job.image}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-20 mb-38">
                    <p className="text-normal font-regular text-black">No jobs found.</p>
                    <Button
                        padding='px-7 py-3'
                    >
                        <p className='text-normal font-regular'>+ Create Job</p>
                    </Button>
                </div>
            )}
        </div>
    )
}

export default MyJobsSection;

