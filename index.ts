import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
let config = new pulumi.Config();
export const up = config.getBoolean("up") || false;

const imagesBucket = new gcp.storage.Bucket("images", {
    location: "asia-northeast1",
    // https://cloud.google.com/storage/docs/access-control/?_ga=2.264253327.-1828257555.1700713845
    uniformBucketLevelAccess: true,
});

const savesBucket = new gcp.storage.Bucket("saves", {
    name: "tsukurou-saves",
    location: "asia-northeast1",
    // https://cloud.google.com/storage/docs/access-control/?_ga=2.264253327.-1828257555.1700713845
    uniformBucketLevelAccess: true,
});

const imageFile = new gcp.storage.BucketObject("tsukurou-image-file.tar.gz", {
    name: "tsukurou-image-file.tar.gz",
    bucket: imagesBucket.name,
    source: new pulumi.asset.FileAsset("images/gce.tar.gz"),
});

const ip = new gcp.compute.Address("tsukurou-ip", {
    addressType: "EXTERNAL",
    region: "asia-northeast1",
    networkTier: "PREMIUM",
});


const image = new gcp.compute.Image("tsukurou-image", {
    rawDisk: {
        source: imageFile.selfLink,
    },
});


const network = new gcp.compute.Network("tsukurou-network", {});

const firewall = new gcp.compute.Firewall("tsukurou-firewall", {
    network: network.name,
    sourceRanges: ["0.0.0.0/0"],

    allows: [{
        protocol: "icmp",
    }, {
        protocol: "tcp",
        ports: ["22", "80", "443", "10000-65535"],
    }, {
        protocol: "udp",
        ports: ["22", "80", "443", "10000-65535"],
    }],
    targetTags: ["game-server"],
});

const serviceAccount = new gcp.serviceaccount.Account("tsukurou-instance", {
    accountId: "tsukurou-instance",
    displayName: "Tsukurou Instance Service Account",
});

const editorBinding = new gcp.projects.IAMBinding("tsukurou-instance-editor", {
    members: [serviceAccount.email.apply(email => `serviceAccount:${email}`)],
    role: "roles/editor",
    project: serviceAccount.project,
});

const storageBinding = new gcp.projects.IAMBinding("tsukurou-storage-admin", {
    members: [serviceAccount.email.apply(email => `serviceAccount:${email}`)],
    project: serviceAccount.project,
    role: "roles/storage.objectAdmin",
});

if (up) {
    new gcp.compute.Instance("tsukurou-server", {
        machineType: "e2-medium",

        bootDisk: {
            initializeParams: {
                image: image.selfLink,
                size: 10,
            }
        },
        networkInterfaces: [{
            network: network.name,
            accessConfigs: [{
                natIp: ip.address
            }],
        }],
        zone: "asia-northeast1-a",

        serviceAccount: {
            email: serviceAccount.email,
            scopes: [
                // Default
                "https://www.googleapis.com/auth/devstorage.read_only",
                "https://www.googleapis.com/auth/logging.write",
                "https://www.googleapis.com/auth/monitoring.write",
                "https://www.googleapis.com/auth/pubsub",
                "https://www.googleapis.com/auth/service.management.readonly",
                "https://www.googleapis.com/auth/servicecontrol",
                "https://www.googleapis.com/auth/trace.append",
                // Others
                "https://www.googleapis.com/auth/devstorage.full_control",
            ],
        },
        tags: ["game-server"],
    });
}



export const serverIp = ip.address;

// Export the DNS name of the bucket
export const bucketName = savesBucket.url;
