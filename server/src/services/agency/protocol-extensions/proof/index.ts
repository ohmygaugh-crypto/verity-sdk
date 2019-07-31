import { IProofAttr } from 'node-vcx-wrapper'
import { IAgentMessage, Protocol } from '..'
import { Agency, IAgencyConfig } from '../..'
import { generateProblemReport } from '../../utils/problem-reports'
import { UnfulfilledProof } from './UnfulfiledProof'

export type ProofProtocolTypes =
| 'did:sov:d8xBkXpPgvyR=d=xUzi42=PBbw;spec/present-proof/0.1/request'
| 'did:sov:d8xBkXpPgvyR=d=xUzi42=PBbw;spec/present-proof/0.1/problem-report'
| 'did:sov:d8xBkXpPgvyR=d=xUzi42=PBbw;spec/present-proof/0.1/status'

export interface IProofMessage extends IAgentMessage {
    proof: {
        name: string,
        proofAttrs: IProofAttr[],
    },
    connectionId: string,
}

export class Proof extends Protocol {

    constructor(config: IAgencyConfig) {
        super(config)
    }

    public router(message: IProofMessage) {
        switch (message['@type']) {
            case 'did:sov:d8xBkXpPgvyR=d=xUzi42=PBbw;spec/present-proof/0.1/request':
                this.proofRequest(message)
                return true
            default: return false
        }
    }

    private async proofRequest(message: IProofMessage) {
        const connection = Agency.inMemDB.getConnection(message.connectionId)
        if (!connection) {
            Agency.postResponse(generateProblemReport(
                'did:sov:d8xBkXpPgvyR=d=xUzi42=PBbw;spec/present-proof/0.1/problem-report',
                `No connection with id \"${message.connectionId}\"`,
                message['@id']),
                this.config,
            )
            return
        }
        const proofManager = new UnfulfilledProof(message, connection, this.config)
        await proofManager.proofRequest()
    }
}
