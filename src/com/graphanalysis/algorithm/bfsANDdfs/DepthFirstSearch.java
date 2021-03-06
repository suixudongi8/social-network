package com.graphanalysis.algorithm.bfsANDdfs;
import java.io.*;
import java.util.Iterator;
import java.util.Vector;

import com.graphanalysis.graphBase.commondefine.GraphReader;
import com.graphanalysis.graphbase.implement.Edge;
import com.graphanalysis.graphbase.implement.Graph;
import com.graphanalysis.graphbase.implement.Path;

public class DepthFirstSearch  implements DFSImpl{
    private boolean[] marked;    // marked[v] = is there an s-v path?
    private int count;           // number of vertices connected to s
    File file = new File("dfsResult");
    String content="";
    public DepthFirstSearch(Graph G, int s) {
        marked = new boolean[G.getNodeNum()];
    }

    // depth first search from v
    public Path dfs(Graph G, int v) {
        Path result = new Path();
    	count++;
        marked[v] = true;
        Iterator<Integer> it = G.getAdjList(v).iterator();
        while(it.hasNext()){
        	int w = it.next();
            if (!marked[w]) {
            		   result.addPath(new Edge(v,w));
                       result.append(dfs(G, w));
            	}
            	//System.out.print(v + " "+ w + "\n");
            }
        return result;
        }

    public boolean marked(int v) {
        return marked[v];
    }

    public int count() {
        return count;
    }

    public static void main(String[] args) {
        //In in = new In(args[0]);
		Vector<Edge> edges = GraphReader.readFromFile("/tmp/tinyG.txt",2);
		Graph G = new Graph(edges);
        int s = Integer.parseInt("1");
        DepthFirstSearch search = new DepthFirstSearch(G, s);
        Path res = search.dfs(G, s);
        res.packetToJson();
        //System.out.print("success!");
    }
}

