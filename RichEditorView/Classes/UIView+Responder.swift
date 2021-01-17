//
//  UIView+Responder.swift
//
//  Created by Caesar Wirth on 11/18/15.
//  Copyright (c) 2015 Caesar Wirth. All rights reserved.
//

import UIKit

extension UIView {

    /**
        Returns true if the view or one of its subviews is the first responder.
        Performs a depth-first search on the subviews, so it can potentially be a heavy operation.
    */
    internal var containsFirstResponder: Bool {
        if isFirstResponder { return true }
        for view in subviews {
            if view.containsFirstResponder { return true }
        }
        return false
    }
    
    enum ViewSide {
        case Left, Right, Top, Bottom
    }

    func addBorder(toSide side: ViewSide, withColor color: CGColor, andThickness thickness: CGFloat) {

        let border = CALayer()
        border.backgroundColor = color

        switch side {
        case .Left: border.frame = CGRect(x: frame.minX, y: frame.minY, width: thickness, height: frame.height); break
        case .Right: border.frame = CGRect(x: frame.maxX, y: frame.minY, width: thickness, height: frame.height); break
        case .Top: border.frame = CGRect(x: frame.minX, y: frame.minY, width: frame.width, height: thickness); break
        case .Bottom: border.frame = CGRect(x: frame.minX, y: frame.maxY, width: frame.width, height: thickness); break
        }

        layer.addSublayer(border)
    }

}
