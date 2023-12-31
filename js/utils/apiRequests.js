const apiURL = 'https://seashell-app-bqaqe.ondigitalocean.app'

/**
 * transforms json to facts usable in front
 * @param {JSON} json 
 * @returns {{id: number, text: string, isTrue: boolean, explaination: string, trueProportion: number, falseProportion: number}}
 */
const jsonToFacts = (json) => {
    let totalVoters = json.nbVoteVrai+json.nbVoteFaux;

    if(totalVoters == 0) {
        totalVoters = 1;
    }

    return {
        id: json.id,
        text: json.intitule,
        isTrue: json.isVraie,
        explaination: json.explication,
        trueProportion: json.nbVoteVrai/totalVoters,
        falseProportion: json.nbVoteFaux/totalVoters
    }
}

const FetchFacts = async () => {
    try {
        const response = await fetch(apiURL + "/questions", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Origin': window.location.origin
            }
        });

        if(response.ok) {
            const json = await response.json();
            return json.map((elem) => jsonToFacts(elem));
        } else {
            const message = await response.text() + "\n(generated by FetchFacts)";
            return Promise.reject({status: response.status,statusText: message});
        }
    } catch (error) {
        console.warn(error.message);
        return Promise.reject({status: 500,statusText: "Server error" + "\n(generated by FetchFacts)"});
    }
}

const PostAnswerOnFact = async (factId, answer) => {
    try {
        let apiRoute = "/questions/vote-";

        if(answer) {
            apiRoute += "vrai/";
        } else {
            apiRoute += "faux/";
        }

        apiRoute += factId;

        const response = await fetch(apiURL + apiRoute, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': window.location.origin
            }
        });

        if(response.ok) {
            const message = await response.text();
            return message;
        } else {
            const message = await response.text() + "\n(generated by PostAnswerOnFact)";
            return Promise.reject({status: response.status,statusText: message});
        }
    } catch (error) {
        console.warn(error.message);
        return Promise.reject({status: 500,statusText: "Server error" + "\n(generated by PostAnswerOnFact)"});
    }
}