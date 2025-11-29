import BidPost from "../bidPost";
import SectionPlaceholder from "./sectionPlaceholder";

const Bids = [
    {
        title: "Bid 1",
        location: "New York, NY",
        tags: ["Tag 1"],
        price: 100,
        currency: "USD",
        deadline: 1716883200,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        status: "pending",
    },
    {
        title: "Bid 2",
        location: "New York, NY",
        tags: ["Tag 1"],
        price: 100,
        currency: "USD",
        deadline: 1716883200,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        status: "accepted",
    },
    {
        title: "Bid 3",
        location: "New York, NY",
        tags: ["Tag 1"],
        price: 100,
        currency: "USD",
        deadline: 1716883200,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        status: "declined",
    },
];
const MyBidsSection = () => {
    return (
        <div>
            <SectionPlaceholder
                title="My Bids"
                description="Review the jobs you have bid on and follow up as needed."
            />

            {Bids.length > 0 ? (
                <div className="grid grid-cols-2 gap-8">
                    {Bids.map((bid) => (
                        <BidPost 
                            key={bid.title} 
                            title={bid.title}
                            location={bid.location}
                            tags={bid.tags}
                            price={bid.price}
                            currency={bid.currency}
                            deadline={bid.deadline}
                            description={bid.description}
                            status={bid.status as "pending" | "accepted" | "declined"} 
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-20 mb-38">
                    <p className="text-normal font-regular text-black">No bids found.</p>
                </div>
            )}
        </div>
    );
};

export default MyBidsSection;

