import Header from "../components/Header";
import { getPaperPendingReview } from "../Common/GetPapers";
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  UncontrolledCollapse,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Col,
  Input,
} from "reactstrap";

export default function TableList({ paperToReview }) {
  const data = paperToReview.map((paper) => {
    return (
      <tr key={paper.paperId}>
        <td>{paper.paperName}</td>
        <td>{paper.paperName}</td>
        <td>
          <Button type="button" className="btn-primary">
            Review
          </Button>
        </td>
      </tr>
    );
  });
  return (
    <Table hover>
      <thead>
        <tr>
          <th>Conference</th>
          <th>Paper</th>
          {/* <th>Expiration Date</th> */}
          {/* <th>Link</th> */}
          <th>Action</th>
        </tr>
      </thead>
      <tbody>{data}</tbody>
    </Table>
  );
}
