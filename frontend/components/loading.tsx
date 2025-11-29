const loading = () => {
    return (
        <div>
            <div className="flex justify-center items-center h-screen bg-white/80 backdrop-blur-sm">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-4 border-gray-900"></div>
            </div>
        </div>
    )
}

export default loading;