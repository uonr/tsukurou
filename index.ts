import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Create a GCP resource (Storage Bucket)
const bucket = new gcp.storage.Bucket("saves", {
    location: "asia-northeast1",
});

const imageFile = new gcp.storage.BucketObject("tsukurou-image-file.tar.gz", {
    name: "tsukurou-image-file.tar.gz",
    bucket: bucket.name,
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

const server = new gcp.compute.Instance("tsukurou-server", {
    machineType: "e2-standard-2",

    bootDisk: {
        initializeParams: {
            image: image.selfLink,
            size: 40,
        }
    },
    networkInterfaces: [{
        network: "default",
        accessConfigs: [{
            natIp: ip.address
        }],
    }],
    zone: "asia-northeast1-a",
});


export const serverIp = ip.address.apply(ip => ip);

// Export the DNS name of the bucket
export const bucketName = bucket.url;
