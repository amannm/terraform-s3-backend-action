import {getIDToken, getInput, setFailed, setOutput} from "@actions/core";
import {STS} from "aws-sdk";
import {randomBytes} from "crypto";
import {promises as fs} from "fs";
import {join} from "path";

async function run() {
    try {
        const accountId = getInput("account-id", {required: true});
        const region = getInput("region", {required: true});
        const bucket = getInput("bucket", {required: true});
        const key = getInput("key", {required: true});
        const role = getInput("role", {required: true});
        const idTokenTask = getIDToken("sts.amazonaws.com")
        const sts = new STS({
            region: region,
            stsRegionalEndpoints: "regional",
            customUserAgent: "configure-aws-credentials-for-github-actions"
        });
        const idToken = await idTokenTask
        const response = await sts.assumeRoleWithWebIdentity({
            RoleArn: `arn:aws:iam::${accountId}:role/${role}`,
            RoleSessionName: "GitHubActions",
            DurationSeconds: 3600,
            WebIdentityToken: idToken,
        }).promise()
        if (response.Credentials) {
            const lines = [
                `bucket = "${bucket}"`,
                `key = "${key}"`,
                `access_key = "${response.Credentials.AccessKeyId}"`,
                `secret_key = "${response.Credentials.SecretAccessKey}"`,
                `token = "${response.Credentials.SessionToken}"`,
            ]
            const filename = randomBytes(12).toString("hex");
            const path = join(".", filename);
            await fs.writeFile(path, lines, {mode: 0o640, flag: "wx"})
            setOutput("path", path)
        } else {
            setFailed("no credentials returned in response")
        }
    } catch (error) {
        setFailed(`action failure: ${error}`)
        throw error
    }
}

run()
