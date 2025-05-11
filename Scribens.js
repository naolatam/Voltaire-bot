const express = require("express");

// Initialiser Quick.DB

const app = express();
const PORT = 8080;
const router = express.Router();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    next();
});

let scribensCache = [];

router.get("/scribens", async (req, res) => {
    const phrase = req.query.phrase;
    if (!phrase) {
        return res
            .status(400)
            .json({ error: "Missing 'phrase' parameter in query" });
    }
    if (scribensCache.filter((a) => a[0] == phrase).length > 0) {
        return scribensCache.filter((a) => a[0] == phrase)[0][1];
    }
    const payLoad = {
        FunctionName: "GetSolutionsByPos",
        plugin: "Website_desktop",
        texteHTML: `<p>${phrase}</p>`,
        optionsCor:
            "Genre_Je:0|Genre_Tu:0|Genre_Nous:0|Genre_Vous:0|Genre_On:0|RefOrth:0|UsBr:-1|ShowUPSol:1",
        optionsStyle:
            "RepMin:3|GapRep:3|AllWords:0|FamilyWords:0|MinPhLg:30|MinPhCt:5|Ttr:250|Tts:150",
        idLangue: "fr",
        firstRequest: false,
        cntRequest30: 0,
        langId: "fr",
        nbc: 
        nbc(phrase),
    };
    let scribensResponse = await fetch(
        "https://www.scribens.fr/Scribens/TextSolution_Servlet",
        {
            method: "POST",
            headers: {
                accept: "*/*",
                "accept-language":
                    "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6",
                "content-type":
                    "application/x-www-form-urlencoded; charset=UTF-8",
                priority: "u=1, i",
                "sec-ch-ua": '"Not.A/Brand";v="99", "Chromium";v="136"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Linux"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                Referer: "https://www.scribens.fr/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
            },
            body: new URLSearchParams(payLoad),
        }
    );
    if (!scribensResponse.ok) {
        return res.status(500).json({
            error: "Failed to fetch data from Scribens",
            status: scribensResponse.status,
        });
    }
    const scribensData = await scribensResponse.json();
    if (!scribensData) {
        return res
            .status(500)
            .json({ error: "Failed to parse Scribens response" });
    }
    return res.status(200).json({
        data: scribensData.Map_PosSol,
        phrase: phrase,
        status: scribensResponse.status,
    });
});

app.use(router);

app.listen(PORT, async () => {
    console.log(`🚀 Serveur démarré sur http://localhost:8080`);
});
function nbc(e) {
    const t = e.replace(/<br>|<\/br>|<p>|<\/p>/g, ""); // Remove <br>, <p> tags
    var n = t.length;
    n >= 755 && (n = 755); // Cap length at 755
    let r = 0;
    for (let e = 0; e < n; e++) {
        const n = t.codePointAt(e), // Unicode code point
            s = n.toString().length; // Digit length of that code point
        r = r + n + s; // Sum code point + its digit length
    }
    this.n1 = parseInt("5f8", 16)
    this.n2 = parseInt("3bb4", 16)
    this.n3 = parseInt("186a0", 16)
    const s = r + t.length + this.n1, // Add total text length + this.n1
        i = String(s * s + this.n2); // Square it, then add this.n2
    return (i.slice(-1) + i.slice(1, -1) + i[0]) // Reorder string
        .split("")
        .reverse()
        .join(""); // Reverse it
}