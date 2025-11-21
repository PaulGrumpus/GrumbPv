import Post from "@/components/post";

const jobs = [
    {
        id: 1,
        title: "Job Title",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        location: "Job Location",
        tags: ["Tag 1", "Tag 2", "Tag 3"],
        price: 100,
        currency: "USD",
        deadline: 1716796800,
        createdAt: 1716796800,
    },
    {
        id: 2,
        title: "Job Title",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        location: "Job Location",
        tags: ["Tag 1", "Tag 2", "Tag 3"],
        price: 100,
        currency: "USD",
        deadline: 1716796800,
        createdAt: 1716796800,
    },
    {
        id: 3,
        title: "Job Title",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        location: "Job Location",
        tags: ["Tag 1", "Tag 2", "Tag 3"],
        price: 100,
        currency: "USD",
        deadline: 1716796800,
        createdAt: 1716796800,
    },
    {
        id: 4,
        title: "Job Title",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        location: "Job Location",
        tags: ["Tag 1", "Tag 2", "Tag 3"],
        price: 100,
        currency: "USD",
        deadline: 1716796800,
        createdAt: 1716796800,
    },
    {
        id: 5,
        title: "Job Title",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        location: "Job Location",
        tags: ["Tag 1", "Tag 2", "Tag 3"],
        price: 100,
        currency: "USD",
        deadline: 1716796800,
        createdAt: 1716796800,
    },
]

const JobsPage = () => {
    return (
        <div>
            <div className="px-16 bg-white pt-46">
                <div className="container mx-auto">
                    <p className="text-display font-bold text-black pb-6">Jobs</p>
                    <p className="text-normal font-regular text-black pb-20">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.</p>
                    <div className="grid grid-cols-2 gap-8 pb-28">  
                        {jobs.map((job) => (
                            <Post 
                                key={job.id} 
                                description={job.description} 
                                title={job.title} 
                                location={job.location} 
                                tags={job.tags} 
                                price={100} 
                                currency={job.currency} 
                                deadline={job.deadline} 
                                createdAt={job.createdAt} 
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JobsPage