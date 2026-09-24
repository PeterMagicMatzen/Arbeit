import { useState } from "react";
import { ProgressActivity } from "@/relume/icons";
import clsx from "clsx";
const VideoIframe = ({ video }) => {
    const [isIframeLoaded, setIsIframeLoaded] = useState(false);
    return (<>
      {!isIframeLoaded && <ProgressActivity className="mx-auto size-16 animate-spin text-white"/>}
      <iframe className={clsx("z-0 mx-auto aspect-video size-full md:w-[738px] lg:w-[940px]", {
            visible: isIframeLoaded,
            hidden: !isIframeLoaded,
        })} src={video} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen onLoad={() => setIsIframeLoaded(true)}/>
    </>);
};
export { VideoIframe };
