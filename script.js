document.getElementById('generateBtn').addEventListener('click', async () => {
    const prefix = document.getElementById('prefixInput').value.trim();
    const rawLinks = document.getElementById('linksInput').value;
    const marginPx = document.getElementById('marginPx').value || 0;
    
    const links = rawLinks.split('\n')
        .map(link => link.trim())
        .filter(link => link.length > 0);
    
    if (links.length === 0) {
        alert("no items!");
        console.log("no items!");
        return;
    }

    const zip = new JSZip();
    const nameRegistry = {};

    links.forEach(link => {
        const urlObj = new URL(link);
        const pathSegments = urlObj.pathname.replace(/\/+$/, "").split("/");

        const slug = pathSegments.pop() || urlObj.hostname;
        
        let baseFilename = prefix ? `${prefix}${slug}` : slug;
        let finalFilename = baseFilename;

        if (nameRegistry[baseFilename]) {
            nameRegistry[baseFilename]++;
            finalFilename = `${baseFilename} (${nameRegistry[baseFilename]})`;
        } else {
            nameRegistry[baseFilename] = 1;
        }

        // 0=autodetect size, H=high error correction (30%)
        const qr = qrcode(0, 'H'); 
        qr.addData(link);
        qr.make();
        const svgString = qr.createSvgTag(marginPx, marginPx);

        zip.file(`${finalFilename}.svg`, svgString);
    });

    const zipContent = await zip.generateAsync({type: "blob"});

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(zipContent);
    downloadLink.download = prefix ? `${prefix}qrcodes.zip` : "qrcodes.zip";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});