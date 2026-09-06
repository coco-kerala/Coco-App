import { CustomerHomeClient } from "./CustomerHomeClient";

export default async function CustomerPage({ searchParams }) {
  const params = await searchParams;
  return <CustomerHomeClient showRequestModal={params?.modal === "request"} />;
}
