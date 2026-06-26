import { SimpleGrid, Card } from "@chakra-ui/react"
import { SkeletonText } from "../ui/skeleton"

const PendingGoals = () => (
  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
    {[...Array(6)].map((_, index) => (
      <Card.Root key={index}>
        <Card.Header>
          <SkeletonText noOfLines={2} />
        </Card.Header>
        <Card.Body>
          <SkeletonText noOfLines={3} />
        </Card.Body>
      </Card.Root>
    ))}
  </SimpleGrid>
)

export default PendingGoals
