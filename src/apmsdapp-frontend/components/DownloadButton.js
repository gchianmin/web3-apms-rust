import { RiDownload2Fill } from "react-icons/ri";

const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL

export default function DownloadButton({ conferencePDA, conferenceId, paperHash, paperName }) {
  const handleDownload = (event) => {
    event.preventDefault();
    const fileUrl = `${bucketUrl}/${conferencePDA}/${conferenceId}/${paperHash}/${paperName}`;
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = paperName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <RiDownload2Fill
      type="button"
      color="green"
      size={25}
      onClick={handleDownload}
      className="mr-3"
    />
  );
}
