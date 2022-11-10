namespace gdjs {
  export namespace pathfinding {
    /**
     * Simplify a path according to an allowed gap.
     *
     * The simplified path vertices are the same instances as the one in
     * the source. They must be cloned to make them truly independent from each
     * other.
     *
     * @param sourceVertices The path to simplify.
     * @param maxGap The maximum distance the edge of the contour may deviate
     * from the source geometry.
     * @param simplifiedVertices The simplified path.
     * @param workingVertices It avoids allocations.
     */
    export const simplifyPath = (
      sourceVertices: FloatPoint[],
      maxGap: float,
      simplifiedVertices: FloatPoint[] = [],
      workingVertices: FloatPoint[] = []
    ): FloatPoint[] => {
      if (sourceVertices.length <= 2) {
        simplifiedVertices.length = 0;
        simplifiedVertices.push.apply(simplifiedVertices, sourceVertices);
        return simplifiedVertices;
      }
      const maxGapSq = maxGap * maxGap;

      // We start with only one rope part.
      // Stretch a rope between the start and the end of the path.
      let previousStepVertices: FloatPoint[] = workingVertices;
      previousStepVertices.length = 0;
      previousStepVertices.push(sourceVertices[0]);
      previousStepVertices.push(sourceVertices[sourceVertices.length - 1]);

      do {
        simplifiedVertices.length = 0;
        simplifiedVertices.push(previousStepVertices[0]);

        // For each part of the rope...
        let sourceIndex = 0;
        for (
          let previousStepVerticesIndex = 0;
          previousStepVerticesIndex + 1 < previousStepVertices.length;
          previousStepVerticesIndex++
        ) {
          const startVertex = previousStepVertices[previousStepVerticesIndex];
          const endVertex = previousStepVertices[previousStepVerticesIndex + 1];

          const startX = startVertex[0];
          const startY = startVertex[1];
          const endX = endVertex[0];
          const endY = endVertex[1];

          // Search the furthest vertex from the rope part.
          let maxDeviationSq = maxGapSq;
          let maxDeviationVertex: FloatPoint | null = null;
          // The first and last vertices of the rope part are not checked.
          for (
            sourceIndex++;
            sourceVertices[sourceIndex] !== endVertex;
            sourceIndex++
          ) {
            const sourceVertex = sourceVertices[sourceIndex];

            const deviationSq = gdjs.pathfinding.getPointSegmentDistanceSq(
              sourceVertex[0],
              sourceVertex[1],
              startX,
              startY,
              endX,
              endY
            );
            if (deviationSq > maxDeviationSq) {
              maxDeviationSq = deviationSq;
              maxDeviationVertex = sourceVertex;
            }
          }
          // Add the furthest vertex to the rope.
          // The current rope part is split in 2 for the next step.
          if (maxDeviationVertex) {
            simplifiedVertices.push(maxDeviationVertex);
          }
          simplifiedVertices.push(endVertex);
        }

        const swapVertices = previousStepVertices;
        previousStepVertices = simplifiedVertices;
        simplifiedVertices = swapVertices;
      } while (
        // Stop when no new vertex were added.
        // It means that the maxGap constraint is fulfilled.
        // Otherwise, iterate over the full path once more.
        simplifiedVertices.length !== previousStepVertices.length
      );
      return simplifiedVertices;
    };

    /**
     * Returns the distance squared from the point to the line segment.
     *
     * Behavior is undefined if the the closest distance is outside the
     * line segment.
     *
     * @param px The X position of point (px, py).
     * @param py The Y position of point (px, py)
     * @param ax The X position of the line segment's vertex A.
     * @param ay The Y position of the line segment's vertex A.
     * @param bx The X position of the line segment's vertex B.
     * @param by The Y position of the line segment's vertex B.
     * @return The distance squared from the point (px, py) to line segment AB.
     */
    export const getPointSegmentDistanceSq = (
      px: float,
      py: float,
      ax: float,
      ay: float,
      bx: float,
      by: float
    ): float => {
      // This implementation is strongly inspired from CritterAI class "Geometry".
      //
      // Reference: http://local.wasp.uwa.edu.au/~pbourke/geometry/pointline/
      //
      // The goal of the algorithm is to find the point on line segment AB
      // that is closest to P and then calculate the distance between P
      // and that point.

      const deltaABx = bx - ax;
      const deltaABy = by - ay;
      const deltaAPx = px - ax;
      const deltaAPy = py - ay;

      const segmentABLengthSq = deltaABx * deltaABx + deltaABy * deltaABy;
      if (segmentABLengthSq === 0) {
        // AB is not a line segment. So just return
        // distanceSq from P to A
        return deltaAPx * deltaAPx + deltaAPy * deltaAPy;
      }

      const u = (deltaAPx * deltaABx + deltaAPy * deltaABy) / segmentABLengthSq;
      if (u < 0) {
        // Closest point on line AB is outside outside segment AB and
        // closer to A. So return distanceSq from P to A.
        return deltaAPx * deltaAPx + deltaAPy * deltaAPy;
      } else if (u > 1) {
        // Closest point on line AB is outside segment AB and closer to B.
        // So return distanceSq from P to B.
        return (px - bx) * (px - bx) + (py - by) * (py - by);
      }

      // Closest point on lineAB is inside segment AB. So find the exact
      // point on AB and calculate the distanceSq from it to P.

      // The calculation in parenthesis is the location of the point on
      // the line segment.
      const deltaX = ax + u * deltaABx - px;
      const deltaY = ay + u * deltaABy - py;

      return deltaX * deltaX + deltaY * deltaY;
    };
  }
}
