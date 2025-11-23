import SectionPlaceholder from "./sectionPlaceholder";
import Button from "../Button";
import GigPost from "../gigPost";

const Gigs = [
    {
        title: "Gig 1",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        subtitle: "Subtitle 1",
        tags: ["Tag 1"],
    },
    {
        title: "Gig 2",
        image: "/Grmps/profile-image.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        subtitle: "Subtitle 2",
        tags: ["Tag 1"],
    },
    {
        title: "Gig 3",
        description: "DescLorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        subtitle: "Subtitle 3",
        tags: ["Tag 1"],
    },
]

const MyGigsSection = () => {
    return (
        <div>
            <SectionPlaceholder
                title="My Gigs"
                description="Track and manage all the gigs you have published."
            />
            {Gigs.length > 0 ? (
                <div>
                    <div className="flex justify-end">
                        <div className="w-45 mb-8 flex justify-end">
                            <Button
                                padding='px-7 py-3'
                            >
                                <p className='text-normal font-regular'>+ Create Gig</p>
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        {Gigs.map((gig) => (
                            <GigPost
                                key={gig.title}
                                title={gig.title}
                                description={gig.description}
                                subtitle={gig.subtitle}
                                tags={gig.tags}
                                image={gig.image}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-20 mb-38">
                    <p className="text-normal font-regular text-black">No gigs found.</p>
                    <Button
                        padding='px-7 py-3'
                    >
                        <p className='text-normal font-regular'>+ Create Gig</p>
                    </Button>
                </div>
            )}
        </div>
    )
}

export default MyGigsSection;

