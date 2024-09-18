import { MD5 } from "../MD5";

describe("MD5 algorithm tests", () => {
  const hashDataset = [
    {
      text: "",
      hash: "D41D8CD98F00B204E9800998ECF8427E",
    },
    {
      text: "a",
      hash: "0CC175B9C0F1B6A831C399E269772661",
    },
    {
      text: "abc",
      hash: "900150983CD24FB0D6963F7D28E17F72",
    },
    {
      text: "Hello",
      hash: "8b1a9953c4611296a827abf8c47804d7".toUpperCase(),
    },
    {
      text: "message digest",
      hash: "F96B697D7CB7938D525A2F31AAF161D0",
    },
    {
      text: "abcdefghijklmnopqrstuvwxyz",
      hash: "C3FCD3D76192E4007DFB496CCA67E13B",
    },
    {
      text: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
      hash: "D174AB98D277D9F5A5611C2C9F419D9F",
    },
    {
      text: "12345678901234567890123456789012345678901234567890123456789012345678901234567890",
      hash: "57EDF4A22BE3C955AC49DA2E2107B67A",
    },
  ];
  it.each(hashDataset)("should match hash", ({ text, hash }) => {
    expect(MD5.hash(text).toUpperCase()).toEqual(hash);
  });
});
