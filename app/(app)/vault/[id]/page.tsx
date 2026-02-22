import { VaultDetailClient } from "@/components/vault/vault-detail-client"

export default async function VaultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <VaultDetailClient itemId={id} />
}

